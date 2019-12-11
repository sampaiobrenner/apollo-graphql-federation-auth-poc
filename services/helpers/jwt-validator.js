const jwt = require('jsonwebtoken');
const jwksRsa = require('jwks-rsa');
var fs = require('fs'),
    path = require('path'),
    filePath = path.join(__dirname, 'public-key.txt');

// Configure client as needed
const client = jwksRsa({
    cache: true,
    strictSsl: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json', //todo: make me configurable.
    requestHeaders: {},
    requestAgentOptions: {},
});

const isDev = () => process.env.NODE_ENV !== 'production';

//todo: move this outa here
const TOKEN_PUBLIC_KEY = isDev() ? fs.readFileSync(filePath) : "(╯°□°）╯︵ ┻━┻"

const JWTValidator = (req, res, next) => {
    const token = req.get('jwt');

    if (token) {

        const jwtVerifyOptns = {ignoreExpiration:true};

        const getSigningKey = (header, cb) =>
            client.getSigningKey(header.kid, (error, key) => {

                if (error) {
                    return res.status(404).send(error.message);
                }

                const signingKey = key.publicKey || key.rsaPublicKey;

                return cb(null, signingKey)
            });

        return jwt.verify(token, isDev() ? TOKEN_PUBLIC_KEY : getSigningKey, jwtVerifyOptns, (err, decoded) => {

            if (err) {
                return res.status(401).send(err.message);
            }

            req.user = decoded;

            return next();
        });
    }

    return next();
};

module.exports = JWTValidator;

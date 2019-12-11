import PostModel from '../Model';

export default async (parent, args, context) => {

    const tokenData = context.req.user;

    if (!tokenData) {
        return {
            success: false,
            error: {
                status: 400,
                message: 'Authorization token required'
            }
        }
    }

    const {isAdmin, canWritePosts} = tokenData

    if (!isAdmin || !canWritePosts) {
        return {
            success: false,
            error: {
                status: 401,
                message: 'You have no permissions to create posts'
            }
        }
    }

    try {

        let postInfo = {
            name: args.request.data.name,
            userId: args.request.data.userId,
            description: args.request.data.description
        }

        await PostModel.createPost(postInfo);

        return {
            success: true,
            error: null
        }

    } catch (e) {
        console.log(e);

        return {
            success: false,
            error: {
                status: 500,
                message: e
            }
        }
    }

}

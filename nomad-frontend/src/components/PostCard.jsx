import { Heart, MessageCircle, Share2, MapPin } from 'lucide-react';

const PostCard = ({ post }) => {
    // Fix: Since backend now saves 'public/temp/file.jpg' and serves it at '/public',
    // we can just append the path directly.
    const imageUrl = post.contentUrl 
        ? `http://localhost:3000/${post.contentUrl}`
        : 'https://via.placeholder.com/400';

    return (
        <div className="card-sketch mb-8 overflow-hidden hover:-translate-y-1 duration-300">
            <div className="p-4 flex items-center justify-between border-b-2 border-black bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-200 border-2 border-black rounded-full flex items-center justify-center font-black text-gray-800">
                        {post.username?.[0]?.toUpperCase() || "N"}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{post.username || "Nomad Traveler"}</h3>
                        <div className="flex items-center text-xs font-bold text-pink-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>Nearby</span>
                        </div>
                    </div>
                </div>
                <div className="badge-sketch bg-white">
                   {new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>

            <div className="w-full bg-gray-100 border-b-2 border-black">
                <img 
                    src={imageUrl} 
                    alt="Drop content" 
                    className="w-full h-auto object-cover max-h-[500px]"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Image+Load+Error"; }}
                />
            </div>

            <div className="p-4 bg-white">
                <div className="flex items-center space-x-4 mb-4">
                    <button className="p-2 rounded-xl hover:bg-pink-50 border-2 border-transparent hover:border-black transition group">
                        <Heart className="w-7 h-7 text-gray-700 group-hover:text-pink-500 group-hover:fill-pink-500 transition" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-black transition group">
                        <MessageCircle className="w-7 h-7 text-gray-700 group-hover:text-blue-500" />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-green-50 border-2 border-transparent hover:border-black transition group ml-auto">
                        <Share2 className="w-7 h-7 text-gray-700 group-hover:text-green-500" />
                    </button>
                </div>

                <div className="bg-yellow-50 p-3 rounded-xl border-2 border-black/10">
                    <p className="text-gray-800">
                        <span className="font-black mr-2">{post.username}</span>
                        {post.caption}
                    </p>
                </div>
                
                <div className="mt-3 flex space-x-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    <span>{post.fuel?.likes || 0} km range</span>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
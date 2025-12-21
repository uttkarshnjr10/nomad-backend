import { useState, useEffect } from 'react';
import useGeoLocation from '../hooks/useGeoLocation';
import { contentApi } from '../services/api';
import PostCard from '../components/PostCard';
import Navbar from '../components/layout/Navbar';
import { Loader2, Image as ImageIcon, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Feed = () => {
  const location = useGeoLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchFeed = async () => {
    if (!location.loaded || !location.coordinates.lat) return;

    try {
      setLoading(true);
      const { lat, lng } = location.coordinates;
      const res = await contentApi.get(`/feed?lat=${lat}&lng=${lng}&radius=5000`);
      setPosts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [location.loaded, location.coordinates.lat]);

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a photo first!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("caption", caption);
    formData.append("latitude", location.coordinates.lat);
    formData.append("longitude", location.coordinates.lng);

    try {
      setIsUploading(true);
      await contentApi.post("/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Drop posted!");
      setCaption("");
      setFile(null);
      fetchFeed();
    } catch (err) {
      toast.error("Failed to drop post.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-yellow-50 overflow-hidden">
      
      <div className="shrink-0 z-50">
        <Navbar />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6 pb-20">

          <div className="card-sketch bg-white p-4 mb-6 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center text-sm font-black text-gray-700">
              <MapPin className="w-5 h-5 text-pink-500 fill-pink-500 mr-2 animate-bounce" />
              {location.error ? "Location disabled" : "Exploring Nearby"}
            </div>
            <div className="badge-sketch bg-pink-100 text-pink-600">
              5km Radius
            </div>
          </div>

          <div className="card-sketch p-5 mb-8 bg-white relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-pink-400 to-yellow-400" />
            
            <form onSubmit={handleDrop}>
              <div className="flex space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full border-2 border-black flex-shrink-0" />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's happening here?"
                  className="w-full bg-gray-50 rounded-xl p-3 border-2 border-transparent focus:border-black focus:bg-white transition outline-none resize-none h-20 font-medium"
                />
              </div>

              {file && (
                <div className="ml-14 mt-3 mb-3 relative inline-block">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-32 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="absolute -top-3 -right-3 bg-red-500 border-2 border-black text-white rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center ml-14 pt-3">
                <label className="cursor-pointer p-2 rounded-lg hover:bg-pink-50">
                  <ImageIcon className="w-6 h-6" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isUploading || !location.loaded}
                  className="btn-sketch bg-black text-white px-6 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                  Drop It
                </button>
              </div>
            </form>
          </div>

          {loading && (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-bold text-gray-400">Scanning radar...</p>
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center py-16 card-sketch bg-white">
              <h3 className="font-black text-xl">No Drops Nearby</h3>
              <p className="text-pink-500 font-bold mt-1">
                Drop a photo to claim this spot!
              </p>
            </div>
          )}

          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}

        </div>
      </div>
    </div>
  );
};

export default Feed;

import { HeartIcon } from "lucide-react";

function ChatLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-pink-50">
      <HeartIcon className="animate-pulse size-12 text-pink-500" />
      <p className="mt-4 text-center text-lg font-medium text-pink-600">
        Connecting to chat...
      </p>
      <span className="loading loading-dots loading-md text-pink-400 mt-2"></span>
    </div>
  );
}

export default ChatLoader;

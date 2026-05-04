import { HeartIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50" data-theme={theme}>
      <div className="text-center">
        <HeartIcon className="size-16 text-pink-500 animate-pulse mx-auto mb-4" />
        <span className="loading loading-dots loading-lg text-pink-500"></span>
        <p className="mt-4 text-pink-600 font-medium">Loading Matchgle...</p>
      </div>
    </div>
  );
};
export default PageLoader;

import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - but auth state should be refetched on mount
    refetchOnMount: true,
  });

  // Return null safety - authUser.data can be null if API fails
  // This prevents "Cannot read properties of null" errors
  return { 
    isLoading: authUser.isLoading, 
    authUser: authUser.data ?? null 
  };
};
export default useAuthUser;


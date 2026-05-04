import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.clear();
      toast.success("Logged out successfully!");
      // Redirect to login page
      window.location.href = "/login";
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;

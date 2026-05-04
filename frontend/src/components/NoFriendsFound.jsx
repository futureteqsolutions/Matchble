import { Link } from "react-router";
import { HeartIcon, UserPlusIcon } from "lucide-react";

const NoFriendsFound = () => {
  return (
    <div className="card bg-base-200 p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="bg-pink-100 p-4 rounded-full">
          <HeartIcon className="size-12 text-pink-400" />
        </div>
      </div>
      <h3 className="font-semibold text-xl mb-2">No friends yet</h3>
      <p className="text-base-content opacity-70 mb-4">
        Start connecting with people below to make new friends!
      </p>
      <Link to="/" className="btn btn-primary">
        <UserPlusIcon className="size-5 mr-2" />
        Discover People
      </Link>
    </div>
  );
};

export default NoFriendsFound;

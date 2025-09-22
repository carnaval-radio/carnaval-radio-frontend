const PostsSkeleten = () => {
  const arr = [1, 2, 4];

  return (
    <>
      {arr.map((_, i) => (
        <div
          key={"postSkeleton" + i}
          className={`${
            i == 0
              ? "bg-tertiaryShade_2"
              : i == 1
              ? "bg-secondaryShade_2"
              : "bg-primaryShade_3"
          } rounded-xl p-5 overflow-hidden space-y-5 w-[370px]`}
        >
          <div
            className={`${
              i == 0
                ? "bg-tertiaryShade_2"
                : i == 1
                ? "bg-secondaryShade_2"
                : "bg-primaryShade_2"
            } h-60 w-[98%] rounded-xl bg-gray-100 animate-pulse`}
          ></div>
          <p className="h-10 w-1/2 bg-gray-200 rounded-md animate-pulse"></p>
          <div
            className={`${
              i == 0
                ? "bg-tertiaryShade_2"
                : i == 1
                ? "bg-secondaryShade_2"
                : "bg-primaryShade_3"
            } mt-2`}
          >
            <p className="mb-1 h-6 bg-gray-200 rounded-md animate-pulse"></p>
            <p className="mb-1 h-6 bg-gray-200 rounded-md animate-pulse"></p>
            <p className="mb-1 h-6 bg-gray-200 rounded-md animate-pulse"></p>
            <p className="mb-1 h-6 bg-gray-200 rounded-md animate-pulse"></p>
          </div>
          <div
            className={`h-12 bg-white border-2 ${
              i == 0
                ? "border-tertiary"
                : i == 1
                ? "border-secondary"
                : "border-primary"
            } rounded-md animate-pulse`}
          ></div>
        </div>
      ))}
    </>
  );
};

export default PostsSkeleten;

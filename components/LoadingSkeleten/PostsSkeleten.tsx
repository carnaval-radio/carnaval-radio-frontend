const PostsSkeleten = () => {
  const arr = [1, 2, 4];

  return (
    <>
      {arr.map((_, i) => (
        <div
          key={i}
          className={`${
            i == 0
              ? "bg-greenShade_2"
              : i == 1
              ? "bg-secondayShade_2"
              : "bg-primaryShade_3"
          } rounded-xl p-5 cursor-pointer overflow-hidden space-y-5 `}
        >
          <div
            className={`${
              i == 0
                ? "bg-greenShade_1"
                : i == 1
                ? "bg-secondayShade_1"
                : "bg-primaryShade_1"
            } h-60 w-[98%] rounded-xl bg-gray-100 animate-pulse`}
          ></div>
          <p className="h-10 w-1/2 bg-gray-200 rounded-md animate-pulse"></p>
          <div
            className={`${
              i == 0
                ? "bg-greenShade_2"
                : i == 1
                ? "bg-secondayShade_2"
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
                ? "border-green"
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

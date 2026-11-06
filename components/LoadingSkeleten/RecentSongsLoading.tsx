const RecentSongsLoading = () => {
  const arr = [1, 2, 3, 4];
  return (
    <>
      {arr.map((_, i) => (
        <div key={"recentSongLoading"+i} className="flex flex-col">
          <div className="flex items-center justify-between gap-2 p-2 bg-gray-200 animate-pulse">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gray-100"></div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
                <div className="h-7 w-full sm:w-[200px] bg-gray-100 rounded-md"></div>
                <div className="h-4 w-3/4 sm:w-24 bg-gray-100 rounded-md"></div>
                <div className="h-6 w-14 rounded-full bg-greenShade_1 sm:hidden"></div>
              </div>
            </div>
            <div className="hidden py-4 px-8 rounded-full bg-greenShade_1 sm:block"></div>
          </div>
          <div className="w-full h-[1px] bg-gray-200"></div>
        </div>
      ))}
    </>
  );
};

export default RecentSongsLoading;

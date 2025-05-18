interface ApplicationCardProps {
  image: string;
  title: string;
  description: string;
}

export function ApplicationCard({
  image,
  title,
  description,
}: ApplicationCardProps) {
  // Image mapping with real royalty-free images from the internet
  const imageMap = {
    interior:
      "https://cdn.pixabay.com/photo/2017/09/09/18/25/living-room-2732939_1280.jpg",
    exterior:
      "https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
    metal: "/metal-paint.jpg",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg">
      <div className="h-48 overflow-hidden">
        <img
          src={
            imageMap[image as keyof typeof imageMap] ||
            "/api/placeholder/400/250"
          }
          alt={`${title} application`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}


import { Link } from 'wouter';

export const EventsPage = () => {
  const events = [
    {
      id: 1,
      title: "Portland Artisan Market",
      date: "2024-02-15",
      time: "10:00 AM - 6:00 PM",
      location: "Pioneer Courthouse Square",
      description: "Join us for a day of local artisan crafts, live demonstrations, and unique finds.",
      image: "/api/placeholder/400/250",
      category: "Market"
    },
    {
      id: 2,
      title: "Craft Workshop: Pottery Basics",
      date: "2024-02-20",
      time: "2:00 PM - 5:00 PM",
      location: "Creative Arts Center",
      description: "Learn the fundamentals of pottery making with experienced artisans.",
      image: "/api/placeholder/400/250",
      category: "Workshop"
    },
    {
      id: 3,
      title: "Artisan Networking Night",
      date: "2024-02-25",
      time: "7:00 PM - 9:00 PM",
      location: "Local Brewery",
      description: "Connect with fellow artisans, share experiences, and build your network.",
      image: "/api/placeholder/400/250",
      category: "Networking"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Artisan Events
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover local markets, workshops, and networking opportunities for artisans and craft enthusiasts
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex space-x-2 mb-4 md:mb-0">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">
              All Events
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Markets
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Workshops
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Networking
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              aria-label="Sort events by"
            >
              <option>Sort by Date</option>
              <option>Sort by Name</option>
              <option>Sort by Location</option>
            </select>
            <button className="btn-primary">Add Event</button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="w-full h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                    {event.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Link href={`/events/${event.id}`}>
                    <button className="flex-1 btn-primary text-sm">
                      View Details
                    </button>
                  </Link>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            Load More Events
          </button>
        </div>
      </div>
    </div>
  );
}; 
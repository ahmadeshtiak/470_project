import React, { useState, useEffect } from react;
import { useNavigate } from react-router-dom;
import axiosInstance from ../utils/axios;
import ImageCarousel from ../components/ImageCarousel;

export default function LandingPage() {
  const [cars, setCars] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [carsResponse, partsResponse] = await Promise.all([
        axiosInstance.get(/cars/latest),
        axiosInstance.get(/parts/latest)
      ]);
      setCars(carsResponse.data.data || []);
      setParts(partsResponse.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || Failed to fetch data);
      console.error(Error fetching data:, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className=min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] flex items-center justify-center>
        <div className=bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] rounded-2xl border border-[#3a241a] shadow-2xl p-10 text-center text-white>
          <div className=mx-auto h-14 w-14 rounded-full border-4 border-t-transparent border-amber-500 animate-spin />
          <p className=mt-4 text-amber-100/90 tracking-wide>Loading AutoForge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=min-h-screen bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] flex items-center justify-center>
        <div className=bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className=min-h-screen w-full bg-gradient-to-b from-[#1f1410] via-[#201311] to-[#2b1a1f] py-10 px-4>
      <div className=max-w-[1600px] mx-auto space-y-12>
        <div className=text-center mb-16>
          <h1 className=text-6xl font-bold text-white mb-4 tracking-tight>
            Welcome to <span className=text-amber-400>AutoForge</span>
          </h1>
          <p className=text-xl text-amber-100/80 max-w-2xl mx-auto leading-relaxed>
            Discover premium cars and parts. Customize, buy, and sell in our automotive marketplace.
          </p>
          <div className=mt-8 flex justify-center gap-4>
            <button
              onClick={() => navigate(/login)}
              className=px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors duration-200
            >
              Get Started
            </button>
            <button
              onClick={() => navigate(/cars)}
              className=px-8 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold rounded-lg transition-colors duration-200
            >
              Browse Cars
            </button>
          </div>
        </div>

        <div className=relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] p-8 shadow-2xl>
          <div className=flex justify-between items-center mb-8>
            <h2 className=text-3xl font-bold text-white>Latest Car Listings</h2>
            <button
              onClick={() => navigate(/cars)}
              className=text-amber-400 hover:text-amber-300 font-medium transition-colors
            >
              View All →
            </button>
          </div>

          {cars.length > 0 ? (
            <div className=grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6>
              {cars.map((car) => (
                <div
                  key={car._id}
                  onClick={() => navigate(`/cars/${car._id}`)}
                  className=bg-gradient-to-br from-[#2a1b14] to-[#23150f] rounded-xl border border-[#3a241a] p-4 cursor-pointer hover:border-amber-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-amber-400/10
                >
                  <div className=aspect-video mb-4 rounded-lg overflow-hidden>
                    <ImageCarousel images={car.images || []} />
                  </div>
                  <h3 className=text-lg font-semibold text-white mb-2>{car.name}</h3>
                  <p className=text-amber-400 font-bold text-xl>${car.price?.toLocaleString()}</p>
                  <p className=text-amber-100/70 text-sm mt-1>{car.year} • {car.condition}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className=text-center py-12>
              <p className=text-amber-100/70>No cars available at the moment.</p>
            </div>
          )}
        </div>

        <div className=relative overflow-hidden rounded-3xl border border-[#3a241a] bg-gradient-to-br from-[#1f1410] via-[#2a1b14] to-[#23150f] p-8 shadow-2xl>
          <div className=flex justify-between items-center mb-8>
            <h2 className=text-3xl font-bold text-white>Latest Parts</h2>
            <button
              onClick={() => navigate(/parts)}
              className=text-amber-400 hover:text-amber-300 font-medium transition-colors
            >
              View All →
            </button>
          </div>

          {parts.length > 0 ? (
            <div className=grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6>
              {parts.map((part) => (
                <div
                  key={part._id}
                  onClick={() => navigate(`/parts/${part._id}`)}
                  className=bg-gradient-to-br from-[#2a1b14] to-[#23150f] rounded-xl border border-[#3a241a] p-4 cursor-pointer hover:border-amber-400/50 transition-all duration-200 hover:shadow-lg hover:shadow-amber-400/10
                >
                  <div className=aspect-video mb-4 rounded-lg overflow-hidden>
                    <ImageCarousel images={part.images || []} />
                  </div>
                  <h3 className=text-lg font-semibold text-white mb-2>{part.name}</h3>
                  <p className=text-amber-400 font-bold text-xl>${part.price?.toLocaleString()}</p>
                  <p className=text-amber-100/70 text-sm mt-1>{part.category} • {part.condition}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className=text-center py-12>
              <p className=text-amber-100/70>No parts available at the moment.</p>
            </div>
          )}
        </div>

        <div className=text-center py-16>
          <h3 className=text-3xl font-bold text-white mb-4>Ready to Join AutoForge?</h3>
          <p className=text-amber-100/80 mb-8 max-w-xl mx-auto>
            Create an account to buy, sell, and customize vehicles. Join our community of automotive enthusiasts.
          </p>
          <div className=flex justify-center gap-4>
            <button
              onClick={() => navigate(/signup)}
              className=px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors duration-200
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate(/login)}
              className=px-8 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-semibold rounded-lg transition-colors duration-200
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

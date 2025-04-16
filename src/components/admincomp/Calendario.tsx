import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Calendario = () => {
  return (
    <div className="bg-white shadow-lg rounded-lg relative">
      <div className="relative bg-[#556B2F] rounded-t-lg h-20 text-center">
        <h2 className="p-5 text-2xl font-semibold mb-1 text-white">
          Calendario
        </h2>
      </div>
      <div className="p-6 flex justify-center "> {/* Usamos Flexbox para centrar */}
        <div className="calendar-container flex justify-center ">
          <Calendar
            calendarType="gregory"
            className="rounded-lg overflow-hidden border-solid border-[rgb(188,149,92)] shadow-sm w-full max-w-xs "
            tileClassName={({ date, view }) =>
              view === 'month' && date.getDate() === new Date().getDate()
                ? 'bg-[rgb(43,100,156)] text-black rounded-full !important' // Día actual con !important
                : 'bg-white text-[rgb(43,100,156)] rounded-full border border-gray-300 hover:bg-cyan-500 hover:text-white !important' // Otros días con !important
            }
            
            prevLabel={<span className="text-[rgb(188,149,92)]">&lt;</span>}
            nextLabel={<span className="text-[rgb(188,149,92)]">&gt;</span>}
            prev2Label={<span className="text-[rgb(188,149,92)]">«</span>}
            next2Label={<span className="text-[rgb(188,149,92)]">»</span>}
            navigationLabel={({ date }) => (
              <span className="text-lg text-[rgb(188,149,92)] font-medium">
                {date.toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          />
        </div>
      </div>
    </div>
    
  );
};

export default Calendario;

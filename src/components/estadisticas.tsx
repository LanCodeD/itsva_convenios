import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const Estadisticas = () => {
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    finalizadas: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "/api/solicitudes_convenios/estadisticas"
        );
        const data = await response.data;
        setStats(data);
      } catch (error) {
        console.error("Error al obtener estadísticas:", error);
      }
    };

    fetchStats();
  }, []);

  const data = {
    labels: ["Pendientes", "Finalizadas"],
    datasets: [
      {
        label: "Número de Solicitudes",
        data: [stats.pendientes, stats.finalizadas],
        backgroundColor: ["#c93457", "#2b649c"],
        borderWidth: 1,
      },
    ],
  };

  // Aquí desactivamos maintainAspectRatio para mayor flexibilidad
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permite que el gráfico se ajuste mejor en pantallas pequeñas
  };

  return (
    <div className="bg-white shadow-lg rounded-lg relative size-full">
      <div className="relative bg-[#E1A95F] rounded-t-lg h-20 text-center">
        <h2 className="p-5 text-2xl font-semibold mb-1 text-white">
          Estadísticas de Convenios
        </h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-textGrisOscuro">
                Total de Solicitudes
              </h3>
              <p className="text-4xl font-bold text-textDorado">{stats.total}</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-textGrisOscuro">
                Solicitudes Pendientes
              </h3>
              <p className="text-4xl font-bold text-[rgb(201,52,87)]">
                {stats.pendientes}
              </p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-textGrisOscuro">
                Solicitudes Finalizadas
              </h3>
              <p className="text-4xl font-bold text-[rgb(43,100,156)]">
                {stats.finalizadas}
              </p>
            </div>
          </div>
          <div className="w-full h-64 md:h-96"> {/* Ajustamos el tamaño del contenedor */}
            <Pie data={data} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { useState, useEffect } from "react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EstadisticasUsuarios = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosMes: 0,
    usuariosActivos: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/api/auth/signup");
        const data = response.data;
        setStats(data);
      } catch (error) {
        console.error("Error al obtener estadísticas de usuarios:", error);
      }
    };

    fetchStats();
  }, []);

  const data = {
    labels: ["Usuarios Registrados", "Usuarios Activos"],
    datasets: [
      {
        label: "Usuarios Registrados",
        data: [stats.usuariosMes, 0], // Solo el dato de usuarios registrados
        backgroundColor: ["#c93457", "#c93457"], // Color de usuarios registrados
        borderWidth: 1,
      },
      {
        label: "Usuarios Activos",
        data: [0, stats.usuariosActivos], // Solo el dato de usuarios activos
        backgroundColor: ["#2b649c", "#2b649c"], // Color de usuarios activos
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Esto hará que el gráfico sea más flexible
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 14, // Aumenta el tamaño de la leyenda para mejorar visibilidad
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        ticks: {
          font: {
            size: 14, // Tamaño de las etiquetas en el eje Y
          },
        },
      },
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-lg relative size-full">
      <div className="relative bg-[#E1A95F] rounded-t-lg h-20 text-center">
        <h2 className="p-5 text-2xl font-semibold mb-1 text-white">
          Estadísticas de Usuarios
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">
              Total de Usuarios
            </h3>
            <p className="text-4xl font-bold text-[rgb(188,149,90)]">
              {stats.totalUsuarios}
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">
              Registrados en el Mes
            </h3>
            <p className="text-4xl font-bold text-[rgb(201,52,87)]">
              {stats.usuariosMes}
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-600">
              Activos en el Mes
            </h3>
            <p className="text-4xl font-bold text-[rgb(43,100,156)]">
              {stats.usuariosActivos}
            </p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Estadísticas de Usuarios
        </h2>
        <div className="w-full h-96">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
};

export default EstadisticasUsuarios;

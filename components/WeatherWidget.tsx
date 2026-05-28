"use client";

import { useEffect, useState } from "react";
import { Droplets, Sun, Wind } from "lucide-react";

type ForecastDay = {
  day: string;
  minTemp: number;
  maxTemp: number;
  icon: string;
  description: string;
};

type WeatherData = {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
  forecast: ForecastDay[];
  location: string;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/weather", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Error al cargar el clima");
        }
        return response.json();
      })
      .then((data: WeatherData) => {
        setWeather(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "No se pudo cargar el clima");
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="rounded-3xl shadow-lg overflow-hidden bg-slate-950 text-white">
      <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300 font-semibold">
              Clima en San Cristóbal
            </p>
            <p className="mt-2 text-xl font-bold">Santa Fe, Argentina</p>
          </div>
          <Sun className="w-11 h-11 text-yellow-300" />
        </div>

        {error ? (
          <div className="rounded-3xl bg-white/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : !weather ? (
          <div className="rounded-3xl bg-white/10 p-4 text-sm text-slate-200">
            Cargando pronóstico...
          </div>
        ) : (
          <>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-6xl font-extrabold leading-none">{Math.round(weather.current.temp)}°</p>
                <p className="text-sm text-slate-300 mt-1 uppercase tracking-widest">
                  {weather.current.description}
                </p>
              </div>
              <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-slate-100">
                <p className="font-semibold">Humedad</p>
                <p>{weather.current.humidity}%</p>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="font-semibold">Viento</p>
                  <p>{weather.current.windSpeed} km/h</p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold mb-3">
                Próximos días
              </p>
              <div className="grid grid-cols-2 gap-3">
                {weather.forecast.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-3xl bg-slate-950/80 p-3 text-center border border-white/10"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400 mb-1">
                      {day.day}
                    </p>
                    <p className="text-2xl mb-1">{day.icon}</p>
                    <p className="text-sm font-semibold">
                      {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 leading-tight">
                      {day.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <div className="border-t border-white/10 p-4 bg-slate-950/95 flex items-center gap-2 text-xs text-slate-400">
        <Droplets className="w-4 h-4 text-cyan-300" />
        Pronóstico real vía OpenWeatherMap
      </div>
    </div>
  );
}

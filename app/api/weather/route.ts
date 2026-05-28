import { NextResponse } from "next/server";

const LATITUDE = -31.6333;
const LONGITUDE = -61.4667;
const BASE_URL = "https://api.openweathermap.org/data/3.0/onecall";

const fallbackWeather = {
  current: {
    temp: 24,
    humidity: 48,
    windSpeed: 18,
    description: "Despejado",
    icon: "Clear",
  },
  forecast: [
    { day: "Mar", minTemp: 18, maxTemp: 26, icon: "☀️", description: "Despejado" },
    { day: "Mié", minTemp: 19, maxTemp: 24, icon: "⛅", description: "Parcialmente nublado" },
    { day: "Jue", minTemp: 17, maxTemp: 22, icon: "🌧️", description: "Lluvias aisladas" },
    { day: "Vie", minTemp: 20, maxTemp: 27, icon: "☀️", description: "Soleado" },
  ],
};

function formatForecastDay(dateString: string, minTemp: number, maxTemp: number, icon: string, description: string) {
  return {
    day: new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(new Date(dateString)),
    minTemp,
    maxTemp,
    icon,
    description,
  };
}

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      ...fallbackWeather,
      location: "San Cristóbal, Santa Fe",
      warning: "OPENWEATHERMAP_API_KEY no está definida en variables de entorno",
    });
  }

  const exclude = "minutely,hourly,alerts";
  const url = `${BASE_URL}?lat=${LATITUDE}&lon=${LONGITUDE}&exclude=${exclude}&units=metric&lang=es&appid=${apiKey}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({
      ...fallbackWeather,
      location: "San Cristóbal, Santa Fe",
      warning: "No se pudo obtener el clima desde OpenWeatherMap, se muestran datos de respaldo",
    });
  }

  const data = await response.json();
  const current = {
    temp: data.current?.temp ?? 0,
    humidity: data.current?.humidity ?? 0,
    windSpeed: data.current?.wind_speed ? Math.round(data.current.wind_speed * 3.6) : 0,
    description: data.current?.weather?.[0]?.description ?? "N/D",
    icon: data.current?.weather?.[0]?.main ?? "",
  };

  const forecast = (data.daily ?? [])
    .slice(1, 5)
    .map((day: any) =>
      formatForecastDay(
        new Date(day.dt * 1000).toISOString(),
        day.temp?.min ?? 0,
        day.temp?.max ?? 0,
        day.weather?.[0]?.main ?? "",
        day.weather?.[0]?.description ?? "",
      ),
    );

  return NextResponse.json({ current, forecast, location: "San Cristóbal, Santa Fe" });
}

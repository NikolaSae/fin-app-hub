// app/providers/page.tsx
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ProvidersListPage() {
  const providers = await db.provajder.findMany();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Lista svih provajdera</h1>
      {providers.length === 0 ? (
        <p className="text-gray-600">Nema unetih provajdera u bazi.</p>
      ) : (
        <ul className="space-y-3">
          {providers.map((provider) => (
            <li key={provider.id}>
              <Link
                href={`/providers/${provider.id}`}
                className="text-blue-600 hover:underline text-lg"
              >
                {provider.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const session = cookieStore.get("taskly_session");
  if (session?.value) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}

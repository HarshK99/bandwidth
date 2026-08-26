import { redirect } from "next/navigation";

/**
 * Direction is the app's home: opening Bandwidth should answer "what should
 * I be doing right now" before anything else.
 */
export default function Home() {
  redirect("/direction");
}

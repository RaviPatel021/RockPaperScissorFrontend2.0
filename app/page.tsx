import { RockPaperScissorsComponent } from "@/components/rock-paper-scissors"
import { SpeedInsights } from '@vercel/speed-insights/next';


export default function Page() {
  return (
    <>
      <RockPaperScissorsComponent />
      <SpeedInsights />
    </>
  );
}
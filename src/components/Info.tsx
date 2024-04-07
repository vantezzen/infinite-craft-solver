import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { BadgeCheck, Github } from "lucide-react";
import Link from "next/link";

export default function Info() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="space-y-2">
          <CardTitle>About</CardTitle>
          <CardDescription>
            Infinite Craft Solver crawls available recipes in the "Infinite
            Craft" game and calculates the fastest way to craft an item.
            <br />
            Simply choose an item in the search bar to get started.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="flex justify-between w-full text-sm">
            <Link className="inline-flex items-center space-x-1" href="/status">
              <BadgeCheck className="w-4 h-4 mr-1.5" />
              Crawler status
            </Link>
            <a
              className="inline-flex items-center space-x-1"
              href="https://github.com/vantezzen/infinite-craft-solver"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="w-4 h-4 mr-1.5" />
              Source
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

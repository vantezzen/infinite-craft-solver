import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import getStatus from "@/lib/status";
import { ChevronUp } from "lucide-react";

export default async function Status() {
  const status = await getStatus();

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-col items-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tighter">
            {status.recipes.toLocaleString()}
          </CardTitle>
          <CardDescription className="text-center">
            <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 text-center">
              Total recipes
              <br />
              <span className="text-xs font-normal">
                +{status.recipesInPastHour.toLocaleString()} past hour
              </span>
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent className="border-t pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center space-y-1">
              <h3 className="text-2xl font-bold">
                {status.items.toLocaleString()}
              </h3>
              <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 text-center">
                Total Items
              </p>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <h3 className="text-2xl font-bold">
                {status.queued.toLocaleString()}
              </h3>
              <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 text-center">
                Recipes Queued
                <br />
                <span className="text-xs font-normal">
                  +{status.queuedPastHour.toLocaleString()} past hour
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

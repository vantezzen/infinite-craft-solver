import { Step } from "@/app/page";
import React from "react";

function Item({ name }: { name: string }) {
  return (
    <div>
      <div className="p-3 rounded-lg border font-medium">{name}</div>
    </div>
  );
}

function Path({ steps }: { steps: Step[] }) {
  return (
    <div className="flex justify-center">
      <div className="p-12 flex flex-col gap-6 justify-center border rounded-lg">
        <h2 className="text-2xl font-bold">
          You'll need {steps.length} steps to craft this item:
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex justify-end gap-3 items-center">
                <Item name={step.first} />
                <div className="text-3xl">+</div>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <Item name={step.second} />
                <div className="text-3xl">=</div>
              </div>
              <div className="flex justify-between items-center">
                <Item name={step.result} />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Path;

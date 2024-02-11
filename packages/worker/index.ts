import Worker from "./src/Worker";

(async () => {
  const worker = new Worker();
  await worker.run();
})();

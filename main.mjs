import { getAllChanges } from "./getBlockChanges.mjs";
import { syncAllBlocks } from "./syncBlocks.mjs";
import { program } from "commander";

program.name("freshDocs");

program
  .command("sync [file]")
  .description("Sync all blocks")
  .action((file) => {
    syncAllBlocks(file);
  });

program
  .command("changes [file]")
  .description("Get all changes")
  .action((file) => {
    getAllChanges(file);
  });

program.parse();


import { promises as fsPromises } from "fs";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import { format } from "date-fns";
// ES Modules don't support __dirname and __filename by default,
// so we reconstruct them using 'url' module
import { fileURLToPath } from "url";

// Getting the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDirectory = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const logEvents = async (message, logFileName) => {
  const dateTime = `${format(new Date(), "yyyyMMdd\t HH:mm:ss")}`;
  const logItem = `${uuid()}\t${dateTime}\t ${message}\n`;
  try {
    await fsPromises.appendFile(path.join(logDirectory, logFileName), logItem);
    // throw new Error(`Something went wrong`);
  } catch (err) {
    console.log(
      ` while trying to write in file ${logFileName} the error is => ${err.message} `
    );
  }
};

export default logEvents;

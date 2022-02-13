import fs from "fs";
import path from "path";

export class FileHandler {
  private static _instance : FileHandler = new FileHandler();

  private constructor() {
    if(FileHandler._instance)
      throw new Error("Use FileHandler.getInstance() instead new FileHandler()")
    FileHandler._instance = this
  }

  public static getInstance() : FileHandler {
    return FileHandler._instance;
  }

  public readFile(pathToFile: string) : any {
    let jsonRaw = fs.readFileSync(path.resolve(__dirname, "../"+pathToFile));
    let json : any = JSON.parse(jsonRaw.toString());
    return json;
  }

  public addToFile(pathToFile: string, dataToWrite: any) : void {
    fs.readFile(path.resolve(__dirname, "../"+pathToFile), 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        let array: Object[] = JSON.parse(data);
        array.push(dataToWrite);
        let json: string = JSON.stringify(array);
        fs.writeFileSync(path.resolve(__dirname, "../"+pathToFile), json, 'utf8');
    }});
  }

  public editFile(pathToFile: string, idToEdit: string, objectLabel: string, dataToWrite: any) : void {
    fs.readFile(path.resolve(__dirname, "../"+pathToFile), 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        let array: any = JSON.parse(data);
        for (let i: number = 0; i < array.length; i++) {
          if (array[i].id === idToEdit) {
            array[i][objectLabel] = dataToWrite;
          }
        }
        let json: string = JSON.stringify(array);
        fs.writeFileSync(path.resolve(__dirname, "../"+pathToFile), json, 'utf8');
    }});
  }

  public deleteFromFile(pathToFile: string, idsToDelete: string[]) : void {
    fs.readFile(path.resolve(__dirname, "../"+pathToFile), 'utf8', function readFileCallback(err, data){
      if (err){
          console.log(err);
      } else {
        let array: [{id: string}] = JSON.parse(data);
        for (let id of idsToDelete) {
          for (let i: number = 0; i < array.length; i++) {
            if (array[i].id === id) {
              array.splice(i, 1);
            }
          }
        }
        let json: string = JSON.stringify(array);
        fs.writeFileSync(path.resolve(__dirname, "../"+pathToFile), json, 'utf8');
    }});
  }
}

export default FileHandler.getInstance();

export class Job {
    name: string;

    path: string;

    constructor(name: string) {
        this.name = name;
    }

    setPath(path){
        this.path = path;
    }

}
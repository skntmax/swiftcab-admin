
import {v1Router} from './CustomeRouter'

interface FileUplaoderConfig {
      data? : Blob   
      error? : string 
      fileName? : string
      contentType? : string
      file?: any
      key?: string
      uploadedUrl:string
}

class FileUploader {
    
    public data: Blob | null = null;  
     public error =null
     private fileName =""
     private contentType = ""
     private putUrl =""
     private key =""
     private uploadedUrl=""


     private async uploadBinaryFile() {
    try {
        if (!this.putUrl || !this.data) {
        throw new Error("Put URL or file data is missing");
        }

        const response = await fetch(this.putUrl, {
        method: "PUT",
        body: this.data, // raw file blob or buffer
        headers: {
            "Content-Type": this.contentType || "application/octet-stream",
        },
        });

        if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
        }

        console.log("Upload successful");
        this.getUrl(encodeURI(this.key))
    } catch (error: any) {
        this.error = error.message;
        console.error("Upload failed:", error);
    }
                    
     }


      private async getUrl(key:string) {
         let res  = await v1Router.get(`master/get-uploaded-file/${key}`)
         if(res?.data){
            this.uploadedUrl = res?.data 
         }

      }

      async purUrlRequest(config: FileUplaoderConfig): Promise<any>  {
         let res  = await v1Router.post("master/upload-to-s3",{fileName:config.fileName, contentType:config.contentType   })
         if(res?.data){
             this.putUrl = res?.data 
              this.data = new Blob([config?.file]);
              this.contentType =  config?.contentType || ""
              this.key = config.file
              this.uploadBinaryFile()
         }
         
        }

        
}



export const  glbalFileUploader = new FileUploader()
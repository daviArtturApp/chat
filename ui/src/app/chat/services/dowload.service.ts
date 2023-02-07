export class DownloadService {

   constructor(private url: string) {}
 
   async dowload() {
     const objUrl = await this.createObjUrl();
     const link$ = await this.createLinkElement(objUrl);
     this.clickInElementForDownload(link$);
   }
 
   private async createObjUrl() {
     const objUrl = window.URL.createObjectURL(await (await fetch(this.url)).blob())
     return objUrl;
   }
 
   private async createLinkElement(objUrl: string) {
     const link$ = document.createElement('a');
     link$.href = objUrl;
     link$.download = '';
     return link$;
   }
 
   private clickInElementForDownload(link$: HTMLAnchorElement) {
     document.body.appendChild(link$);
     link$.click();
     document.body.removeChild(link$);
   }
 }
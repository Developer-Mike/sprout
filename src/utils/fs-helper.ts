export default class FSHelper {
  static SPROUT_PROJECT_TYPE = { description: "Sprout project", accept: { "application/sprout": [".sprout"] } }

  static async openFile(window: Window, fileTypes: any[]): Promise<FileSystemFileHandle | null> {
    const fileOptions = { 
      excludeAcceptAllOption: true,
      types: fileTypes
    }

    try {
      const fileHandle = await (window as any).showOpenFilePicker(fileOptions)[0]
      return fileHandle[0]
    } catch (e: any) {
      if (e.name != "AbortError") console.error(e)
      return null
    }
  }

  static async saveFile(window: Window, suggestedName: string, fileTypes: any[]): Promise<FileSystemFileHandle | null> {
    const fileExtension = (Object.values(fileTypes[0]?.accept) as any)?.[0]?.[0] ?? ""

    const fileOptions = {
      excludeAcceptAllOption: true,
      suggestedName: suggestedName + fileExtension,
      types: [fileTypes]
    }

    try {
      const fileHandle = await (window as any).showSaveFilePicker(fileOptions)
      return fileHandle
    } catch (e: any) {
      if (e.name != "AbortError") console.error(e)
      return null
    }
  }
}
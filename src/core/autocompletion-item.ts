import { ProjectData } from "@/types/ProjectData"

/**
 * Represents an autocompletion item.
 * 
 * @property value The value of the item. If the value is *, it means that the item is a wildcard.
 * @property type The type of the item.
 * @property description Some additional information about the item.
 * @property children The children of the item.
 */
export default interface AutocompletionItem {
  type: AutocompletionItemType
  description?: string
  children: Record<string, AutocompletionItem>
}

export enum AutocompletionItemType {
  KEYWORD,
  CONSTANT,
  VARIABLE,
  FUNCTION
}

export function getGlobalAutocompletionSuggestions(projectData: ProjectData): Record<string, AutocompletionItem> {
  return {
    "stage": {
      type: AutocompletionItemType.CONSTANT,
      children: {
        "width": {
          type: AutocompletionItemType.CONSTANT,
          description: projectData.stage.width.toString(),
          children: {}
        },
        "height": {
          type: AutocompletionItemType.CONSTANT,
          description: projectData.stage.height.toString(),
          children: {}
        }
      }
    },
    "sprites": {
      type: AutocompletionItemType.CONSTANT,
      children: Object.entries(projectData.sprites).reduce((acc, [key, sprite]) => ({
        ...acc,
        [key]: {
          type: AutocompletionItemType.CONSTANT,
          children: {
            "width": {
              type: AutocompletionItemType.CONSTANT,
              description: sprite.width.toString(),
              children: {}
            },
            "height": {
              type: AutocompletionItemType.CONSTANT,
              description: sprite.height.toString(),
              children: {}
            }
          }
        }
      }), {})
    },
    "game_objects": {
      type: AutocompletionItemType.CONSTANT,
      children: Object.values(projectData.gameObjects).reduce((acc, gameObject) => ({
        ...acc,
        [gameObject.id]: {
          type: AutocompletionItemType.CONSTANT,
          children: {
            "is_clone": {
              type: AutocompletionItemType.CONSTANT,
              description: false.toString(),
              children: {}
            },
            "id": {
              type: AutocompletionItemType.CONSTANT,
              description: gameObject.id,
              children: {}
            },
            "transform": {
              type: AutocompletionItemType.CONSTANT,
              children: {
                "x": {
                  type: AutocompletionItemType.VARIABLE,
                  description: gameObject.transform.x.toString(),
                  children: {}
                },
                "y": {
                  type: AutocompletionItemType.VARIABLE,
                  description: gameObject.transform.y.toString(),
                  children: {}
                },
                "rotation": {
                  type: AutocompletionItemType.VARIABLE,
                  description: gameObject.transform.rotation.toString(),
                  children: {}
                },
                "width": {
                  type: AutocompletionItemType.VARIABLE,
                  description: gameObject.transform.width.toString(),
                  children: {}
                },
                "height": {
                  type: AutocompletionItemType.VARIABLE,
                  description: gameObject.transform.height.toString(),
                  children: {}
                }
              }
            },
            "visible": {
              type: AutocompletionItemType.VARIABLE,
              description: gameObject.visible.toString(),
              children: {}
            },
            "layer": {
              type: AutocompletionItemType.VARIABLE,
              description: gameObject.layer.toString(),
              children: {}
            },
            "sprites": {
              type: AutocompletionItemType.CONSTANT,
              children: gameObject.sprites.reduce((acc, spriteKey) => ({
                ...acc,
                [spriteKey]: {
                  type: AutocompletionItemType.CONSTANT,
                  children: {}
                }
              }), {})
            },
            "active_sprite": {
              type: AutocompletionItemType.VARIABLE,
              description: gameObject.active_sprite.toString(),
              children: {}
            }
          }
        }
      }), {})
    }
  }
}
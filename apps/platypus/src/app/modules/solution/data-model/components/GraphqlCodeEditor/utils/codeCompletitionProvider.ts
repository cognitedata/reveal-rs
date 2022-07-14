import { BuiltInType } from '@platypus/platypus-core';
import { editor, languages, Position } from 'monaco-editor';

import ProviderResult = languages.ProviderResult;
import CompletionList = languages.CompletionList;
import CompletionItemProvider = languages.CompletionItemProvider;
import CompletionItem = languages.CompletionItem;

const toCompletitionItem = (
  textUntilPosition: string,
  type: BuiltInType,
  iconKind: languages.CompletionItemKind,
  prefix = ''
) => {
  // check the current line that the user is editing
  // if matches on of this formats, just add the type, otherwise add space
  /**
   * Formats:
   * 1. field:{space}
   * 2. {space}
   * 2. @
   */
  let insertText = textUntilPosition.match(/(:[\s]{1,}|[\s]{1,}|[@])/)
    ? type.name
    : ' ' + type.name;

  // if current line does not include prefix and insert text does not includes also
  // just append in the line. Prefix could be something like "@"
  if (!insertText.includes(prefix) && !textUntilPosition.includes(prefix)) {
    insertText = prefix + insertText;
  }

  return {
    label: type.name,
    kind: iconKind,
    insertText,
    insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
  } as CompletionItem;
};

const getCodeCompletitionItems = (
  textUntilPosition: string,
  builtInTypes: BuiltInType[],
  completitionType: string
) => {
  const iconsMap = {
    DIRECTIVE: languages.CompletionItemKind.Interface,
    OBJECT: languages.CompletionItemKind.Class,
    SCALAR: languages.CompletionItemKind.Text,
  } as {
    [key: string]: languages.CompletionItemKind;
  };
  const prefix = completitionType === 'DIRECTIVE' ? '@' : '';

  // filter code completition items from type
  return builtInTypes
    .filter((builtInType) => {
      if (builtInType.type === 'DIRECTIVE') {
        return true;
      }
      return builtInType.type === completitionType;
    })
    .map((builtInType) =>
      toCompletitionItem(
        textUntilPosition,
        builtInType,
        iconsMap[completitionType],
        prefix
      )
    );
};
/**
 * Provides code completition items for code editor
 */
export const autoCompleteProvider = (builtInTypes: BuiltInType[]) => {
  const completionItemProvider: CompletionItemProvider = {
    // Run this function when the period or open parenthesis is typed
    triggerCharacters: [':', '[', ']', '@'],
    provideCompletionItems: (model: editor.ITextModel, position: Position) => {
      // get the text from current line
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const customTypes = [] as BuiltInType[];

      // get the code as string from code editor
      const codeEditorValue = model.getValue();

      // extract all current custom types from code editor
      (codeEditorValue.match(/type\s[A-Z][a-zA-Z0-9_]+/gm) || []).forEach(
        (matchedType: string) => {
          // Do something with each element
          customTypes.push({
            name: matchedType.replace('type ', ''),
            type: 'OBJECT',
          });
        }
      );

      // handle case when user request code completition
      // for type. In this case return directives from built in types
      if (textUntilPosition.trim().match(/type [A-Z][a-zA-Z0-9_]+/)) {
        return {
          suggestions: getCodeCompletitionItems(
            textUntilPosition,
            builtInTypes,
            'DIRECTIVE'
          ),
        };
      }

      // handle case when user request code completition
      // for field. In this case return all built in and custom types
      if (textUntilPosition.trim().match(/[a-zA-Z0-9_]+:/)) {
        return {
          suggestions: getCodeCompletitionItems(
            textUntilPosition,
            builtInTypes,
            'SCALAR'
          )
            .concat(
              getCodeCompletitionItems(
                textUntilPosition,
                builtInTypes,
                'OBJECT'
              )
            )
            .concat(
              getCodeCompletitionItems(textUntilPosition, customTypes, 'OBJECT')
            ) as CompletionItem[],
        };
      }

      return { suggestions: [] } as ProviderResult<CompletionList>;
    },
  };

  return completionItemProvider;
};

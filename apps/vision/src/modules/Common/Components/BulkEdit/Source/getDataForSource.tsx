import { BulkEditTableDataType } from '@vision/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { getOriginalValue } from '@vision/modules/Common/Components/BulkEdit/utils/getOriginalValue';
import { getUpdatedValue } from '@vision/modules/Common/Components/BulkEdit/utils/getUpdatedValue';
import { BulkEditUnsavedState } from '@vision/modules/Common/store/common/types';
import { VisionFile } from '@vision/modules/Common/store/files/types';

export const getDataForSource = ({
  selectedFiles,
  bulkEditUnsaved,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
}): BulkEditTableDataType[] => {
  const { source: newSource } = bulkEditUnsaved;

  return selectedFiles.map((file) => {
    const { name, source } = file;

    return {
      name,
      original: getOriginalValue({ originalValue: source }),
      updated: getUpdatedValue({ originalValue: source, newValue: newSource }),
    };
  });
};

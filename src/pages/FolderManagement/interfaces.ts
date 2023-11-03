export interface FOLDER_MODEL {
  id?: number;
  description: string;
}

export interface FOLDER_MODEL_EXTENDED extends FOLDER_MODEL {
  updated_at: string;
  fileCount: number;
  updatedBy: string;
  fileSize: string;
  name: string;
  Name: string;
  csId?: number;
  csName?: string;
}

export interface FIELD_UI {
  fieldId: number;
  name: string;
  formatId: number;
  formatName: string;
  typeId: number;
  typeName: string;
  width: number;
  flags: { fieldId: number; name: string; flagId: number }[];
  lists: { id: number; name: string; field_id: number; order_no: number }[];
}

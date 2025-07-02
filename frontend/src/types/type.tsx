export interface fetchedDataResponse {
  data: dataType;
}

export interface dataType {
  id: number;
  entry_date: string;
  doc_title: string;
  doc_data: string;
}

export type RootStackParamList = {
  Reports: undefined;
  CreateReport: undefined;
  ReportDetail: { reportId: string };
  EditReport: { reportId: string };
  PhotoDetail: {
    photoId: string;
    reportId: string;
    photoIds?: string[];
    fastMode?: boolean;
  };
  Settings: undefined;
};

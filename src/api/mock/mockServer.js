// Mock API khi chạy với VITE_USE_MOCK=true. Trả null = không có mock -> gọi BE thật.
// TODO: bổ sung route mock theo Docs/API_FE.md mục 8.
export async function mockFetch() {
  return null;
}

import axios from "axios";
import { getApiBaseUrl } from "../utils/apiUtils";
import { MeasureSimpleDTO } from "../types/measure";

export async function fetchRecentMeasures(
  userId: string
): Promise<MeasureSimpleDTO[]> {
  const response = await axios.get<MeasureSimpleDTO[]>(
    `${getApiBaseUrl()}getrecentmeasure/${userId}`
  );
  return response.data;
}

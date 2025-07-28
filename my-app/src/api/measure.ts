import axios from "axios";
import { MeasureSimpleDTO } from "../types/measure";

export async function fetchRecentMeasures(
  userId: string
): Promise<MeasureSimpleDTO[]> {
  const response = await axios.get<MeasureSimpleDTO[]>(
    `${process.env.REACT_APP_API_BASE_URL}getrecentmeasure/${userId}`
  );
  return response.data;
}

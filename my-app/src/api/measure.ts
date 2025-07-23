import axios from "axios";
import { MeasureSimpleDTO } from "../types/measure";

export async function fetchRecentMeasures(
  userId: string
): Promise<MeasureSimpleDTO[]> {
  const response = await axios.get<MeasureSimpleDTO[]>(
    `https://localhost:8080/getrecentmeasure/${userId}`
  );
  return response.data;
}

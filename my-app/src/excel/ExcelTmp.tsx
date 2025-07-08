import axios from "axios";
import { blob } from "stream/consumers";

const ExcelTmp = () => {
  const download = () => {
    axios
      .get("https://localhost:8080/api/excel/download", {
        responseType: "blob", // 파일 데이터를 받기위해 blob으로 설정해야함.
      })
      .then((res) => {
        console.log(res);

        // 브라우저에서 다운로드 처리
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        // 다운로드될 파일명 설정
        link.setAttribute("download", "data.xlsx");
        document.body.appendChild(link);
        link.click();

        // 요소 삭제
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  };

  return (
    <>
      <button type="button" onClick={download}>
        다운로드
      </button>
    </>
  );
};
export default ExcelTmp;

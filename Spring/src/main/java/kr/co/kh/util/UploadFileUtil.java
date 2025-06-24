package kr.co.kh.util;

import kr.co.kh.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.imgscalr.Scalr;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.text.DecimalFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.UUID;

@Slf4j
public class UploadFileUtil {

    /**
     * 첨부파일 확장자 체크
     * @param file
     * @return
     * @throws Exception
     */
    public static boolean fileMimeType(InputStream file) throws Exception {


        try {
            List<String> typeList = Arrays.asList("image/gif", "image/jpg", "image/jpeg", "image/png", "image/bmp", "application/pdf", "application/xml", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/x-tika-ooxml", "video/mp4", "video/quicktime");

            String mimeType = new Tika().detect(file);

            log.info("mimeType >>>> {}", mimeType);

            return typeList.stream().anyMatch(item -> item.equalsIgnoreCase(mimeType));
        } catch (IOException e) {
            return false;
        }
    }

    public static boolean mimeIsImage(MultipartFile file) {
        try {
            List<String> typeList = Arrays.asList("image/gif", "image/jpg", "image/jpeg", "image/png", "image/bmp");

            String mimeType = new Tika().detect(file.getInputStream());

            return typeList.stream().anyMatch(item -> item.equalsIgnoreCase(mimeType));
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * @param uploadPath
     * @param file
     * @return 생성된 파일 명(유일한 값)
     * @throws IllegalStateException
     * @throws IOException
     */
    public static String fileSave(String uploadPath, MultipartFile file) throws Exception {

        if (fileMimeType(file.getInputStream())) {
            File uploadPathDir = new File(uploadPath);
            if ( !uploadPathDir.exists() ) uploadPathDir.mkdirs();

            // 파일 중복명 처리
            String genId = UUID.randomUUID().toString();

            String originalFileName = file.getOriginalFilename();
            String fileExtension = getExtension(originalFileName);
            String saveFileName = genId + "." + fileExtension;

            String savePath = calcPath(uploadPath);

            File target = new File(uploadPath + savePath, saveFileName);

            FileCopyUtils.copy(file.getBytes(), target);

            // 업로드 하는 파일이 이미지이고, 이미지의 가로 사이즈가 1920보다 크면 1920픽셀로 리사이징해서 저장한다.
            if (mimeIsImage(file)) {
                BufferedImage image = ImageIO.read(file.getInputStream());
                int width = image.getWidth();
                if (width >= 1920) {
                    makeThumbnail(uploadPath, savePath, saveFileName, 1920);
                }
            }

            return makeFilePath(uploadPath, savePath, saveFileName);
        } else {
            throw new BadRequestException("파일을 업로드 할 수 없습니다. 업로드 불가능한 파일타입이거나 위변조된 파일일 가능성이 있습니다.");
        }
    }

    /**
     * 파일이름으로부터 확장자를 반환
     *
     * @param fileName
     *            확장자를 포함한 파일 명
     * @return 파일 이름에서 뒤의 확장자 이름만을 반환
     */
    public static String getExtension(String fileName) {
        int dotPosition = fileName.lastIndexOf('.');

        if (-1 != dotPosition && fileName.length() - 1 > dotPosition) {
            return fileName.substring(dotPosition + 1);
        } else {
            return "";
        }
    }

    /**
     * 폴더명 생성
     * @param uploadPath
     * @return
     */
    private static String calcPath(String uploadPath) {

        Calendar cal = Calendar.getInstance();

        String yearPath = File.separator + cal.get(Calendar.YEAR);
        String monthPath = yearPath + File.separator + new DecimalFormat("00").format(cal.get(Calendar.MONTH) + 1);
        String datePath = monthPath + File.separator + new DecimalFormat("00").format(cal.get(Calendar.DATE));

        makeDir(uploadPath, yearPath, monthPath, datePath);

        log.info(datePath);

        return datePath;
    }

    /**
     * 폴더 생성
     * @param uploadPath
     * @param paths
     */
    private static void makeDir(String uploadPath, String... paths) {

        System.out.println(paths[paths.length - 1] + " : " + new File(paths[paths.length - 1]).exists());
        if (new File(paths[paths.length - 1]).exists()) {
            return;
        }

        for (String path : paths) {
            File dirPath = new File(uploadPath + path);

            if (!dirPath.exists()) {
                dirPath.mkdir();
            }
        }
    }

    /**
     * 파일 경로 생성
     * @param uploadPath
     * @param path
     * @param fileName
     * @return
     * @throws IOException
     */
    private static String makeFilePath(String uploadPath, String path, String fileName) throws IOException {
        String filePath = uploadPath + path + File.separator + fileName;
        return filePath.substring(uploadPath.length()).replace(File.separatorChar, '/');
    }

    /**
     * 이미지 리사이즈
     * @param uploadPath
     * @param path
     * @param fileName
     * @param imageWidth
     * @return
     * @throws Exception
     */
    private static String makeThumbnail(String uploadPath, String path, String fileName, int imageWidth) throws Exception {

        BufferedImage sourceImg = ImageIO.read(new File(uploadPath + path + File.separator, fileName));

        BufferedImage destImg = Scalr.resize(sourceImg, Scalr.Method.AUTOMATIC, Scalr.Mode.FIT_TO_HEIGHT, imageWidth);

        String thumbnailName = uploadPath + path + File.separator + fileName;

        File newFile = new File(thumbnailName);
        String formatName = fileName.substring(fileName.lastIndexOf(".") + 1);

        ImageIO.write(destImg, formatName.toUpperCase(), newFile);

        return thumbnailName.substring(uploadPath.length()).replace(File.separatorChar, '/');
    }

}

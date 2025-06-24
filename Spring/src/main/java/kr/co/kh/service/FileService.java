package kr.co.kh.service;

import lombok.extern.slf4j.Slf4j;
import org.imgscalr.Scalr;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Slf4j
public class FileService {

    private final Path rootLocation;
    public FileService(String uploadPath) {
        this.rootLocation = Paths.get(uploadPath);
    }

    private Path loadPath(String fileName) {
        return rootLocation.resolve(fileName);
    }

    /**
     * 이미지 썸네일
     * @param filePath
     * @param fileName
     * @param fileExt
     * @throws Exception
     */
    public void makeThumbnail(String filePath, String fileName, String fileExt) throws Exception {
        BufferedImage srcImg = ImageIO.read(new File(filePath));
        // 썸네일 너비와 높이
        int dw = 250;
        int dh = 150;
        // 원본 이미지의 너비와 높이
        int ow = srcImg.getWidth();
        int oh = srcImg.getHeight();
        // 원본 너비를 기준으로 썸네일의 비율로 높이 계산
        int nw = ow;
        int nh = (ow * dh) / dw;
        // 계산된 높이가 원본보다 높으면 crop이 안되므로 원본 높이를 기준으로 썸네일의 비율로 너비를 계산
        if(nh > oh) {
            nw = (oh * dw) / dh;
            nh = oh;
        }
        // 계산된 크기로 원본이미지를 가운데에서 crop
        BufferedImage cropImg = Scalr.crop(srcImg, (ow-nw)/2, (oh-nh)/2, nw, nh);
        // crop된 이미지로 썸네일을 생성
        BufferedImage destImg = Scalr.resize(cropImg, dw, dh);

        Path file = loadPath(fileName);

        // 썸네일 저장
        String splitStr[] = filePath.split("/");
        String fName = "";
        for(int i = 0; i < splitStr.length; i++) {
            if(i == splitStr.length - 1) {
                fName = splitStr[i];
            }
        }
        String finalStr = "";
        for(int i = 0; i < splitStr.length; i++) {
            if(i == 0) {
                finalStr += "";
            } else if(i == splitStr.length - 1) {
                finalStr += "/THUMB_" + fName;
            } else {
                finalStr += "/" + splitStr[i];
            }
        }
        // 파일 확장자
        String splitExt[] = fileExt.split("/");
        String eName = "";
        for(int i = 0; i < splitExt.length; i++) {
            if(i == splitExt.length - 1) {
                eName = splitExt[i];
            }
        }

        File thumbFile = new File(finalStr);

        ImageIO.write(destImg, eName, thumbFile);
    }

}

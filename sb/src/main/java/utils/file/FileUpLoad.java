package utils.file;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public class FileUpLoad {
	
	final String LOCAL_FILE_PATH = "e:\\test\\";
	
	
	public void createFile(List<MultipartFile> fileList,String prefix) throws IOException{
		
		File localFilePath = new File(LOCAL_FILE_PATH);
		
		if (!localFilePath.isDirectory()) {
			boolean mkFlag = localFilePath.mkdirs();
			
			if (!mkFlag) {
				throw new IOException("Directory creation Failed ");
			}
		}
		
		File createFilePath = null;
		
		for(MultipartFile file : fileList){
			if(file.isEmpty() == false){
				createFilePath = new File(LOCAL_FILE_PATH+prefix);
				file.transferTo(createFilePath);
			}
		}
		
		
	}

}

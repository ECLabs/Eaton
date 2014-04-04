package documents;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;

import org.apache.poi.POIOLE2TextExtractor;
import org.apache.poi.extractor.ExtractorFactory;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.openxml4j.exceptions.OpenXML4JException;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.xmlbeans.XmlException;



public class WordDocExtractor {
	
	public String extractText(File file) throws IOException, InvalidFormatException, OpenXML4JException, XmlException{
		FileInputStream fis = new FileInputStream(file);
		POIFSFileSystem fileSystem = new POIFSFileSystem(fis);
		POIOLE2TextExtractor oleTextExtractor =  ExtractorFactory.createExtractor(fileSystem);
		return oleTextExtractor.getText();
	}
	
	public void convertDocs(String fromDir, String toDir) throws FileNotFoundException{
		File[] files = new File(fromDir).listFiles();
	    for (File file : files){
	    	if (file.isDirectory()){
	    		convertDocs(file.getName(), toDir);
	    	} else {
	    		PrintWriter pw = new PrintWriter(toDir+"/"+file.getName()+".txt");
	    		String text;
	    		try {
	    			text = extractText(file);
	    		} catch (Exception e){
	    			continue;
	    		}
	    		pw.println(text);
	    		pw.close();
	    	}
	    	
	    }
	}
	
	public static void main(String [] args){
		WordDocExtractor wde = new WordDocExtractor();
		try {
			wde.convertDocs("C:/resume-project/resume/worddocs","C:/resume-project/resume/text");
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}

}

package data;


import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import rss.Feed;
import rss.FeedMessage;
import rss.RSSFeedParser;

public class RSSResumeJunction {
	
	Map<String, Map<String, Integer>> titlePerson = new HashMap<String, Map<String, Integer>>();
	public void matchNewsFeedWithPerson() throws IOException{
		RSSFeedParser parser = new RSSFeedParser("http://rss.nytimes.com/services/xml/rss/nyt/Technology.xml");
		Feed feed = parser.readFeed();
		ResumeData rd = new ResumeData();
		NLPMachine nlpm = new NLPMachine();
		rd.loadData("C:/resume-project/resume/text");
		Map<String, Map<String, Integer>> keywordPersons = rd.getKeywordPersons();
		for (FeedMessage message : feed.getMessages()) {
			Map<String, Integer> personWeight = new HashMap<String, Integer>();
			List<String> keywords = nlpm.PosTagString(message.getTitle() + " " + message.getDescription());
			for (String keyword : keywords) {
				personWeight.putAll(keywordPersons.get(keyword));
			}
			titlePerson.put(message.getTitle(), personWeight);
		}
	}
}

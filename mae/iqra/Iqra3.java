package mae.iqra;

/**    @author M A Eyler
 * Sep 29, 2003, Created 4:33 AM  
 * Jan 02, 2004  iqra package --> ezvu 
 * Nov 04, 2006  BasicArrowButton
 * Oct 19, 2009  text & area added -- compiled with java 4
 * Sep 25, 2011  GIF --> gif
 * Apr-May 2012  V3.0 Arabic text
 * Mar 21, 2015  Scaler
 * Dec 05, 2015  Bookmarks
 */

import java.io.*;
import java.awt.Cursor;
import java.awt.event.*;
import javax.swing.JPopupMenu;
import javax.swing.JMenuItem;
import javax.swing.JEditorPane;
import javax.swing.AbstractAction;
import javax.swing.text.JTextComponent;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import javax.swing.text.BadLocationException;
import java.util.Map;
import java.util.HashMap;
import mae.util.Scaler;

public class Iqra3 extends MouseAdapter 
    implements MouseMotionListener, ActionListener, ChangeListener {
    
    final static String TITLE = "Iqra V3.06"; 
    final static String QUR = "/Quran.txt"; 
    final static String KUR = "/Kuran.txt"; 
    final static String NAM = "/iqra.names";
    final static int SIZE = (Scaler.RESOLUTION<100? 5 : 6);
    //Scaler.HTML_SIZE; //+ 1;  //4,5,6
    final static String HEAD = "<FONT size="+SIZE+" FACE=me_quran><center>";
    final static String TAIL = "</FONT>";
    final static int P = 604; //pages
    final static int M = 114; //suras
    final static Cursor 
      HAND = Cursor.getPredefinedCursor(Cursor.HAND_CURSOR),
      MOVE = Cursor.getPredefinedCursor(Cursor.MOVE_CURSOR),
      TEXT = Cursor.getPredefinedCursor(Cursor.TEXT_CURSOR);

    final Panel pan;
    final JEditorPane html;
    final String[] names = new String[M+1];
    final int[] first = new int[M+1];
    final String[] qur, kur;
    
    boolean playing;
    int curSura, curPage;
    String word;
    File file;
    JPopupMenu popup;
    Map<String,Reference> map;
    
    public Iqra3() {
        pan = new Panel(this);  //exit, this);
        popup = new JPopupMenu();
        html = pan.html;
        InputStream is;
        
        qur = Util.readFile(QUR);
           System.out.println(QUR+" "+qur.length); 
        kur = Util.readFile(KUR);
           System.out.println(KUR+" "+kur.length); 
        readNames(); 
           System.out.println("readNames "+names.length); 
        gotoSura(1);
        pan.slider.requestFocusInWindow(); 
    }
    public void setState(String s) {
        int[] a = Mark.split(s);
        gotoPage(a[0]);
        html.select(a[1], a[2]);
    }
    public String getState() {
        int i = html.getSelectionStart();
        int j = html.getSelectionEnd();
        return Mark.combine(curPage, i, j);
    }
    public int suraFromPage(int k) {
        int i = 0;
        while (k > first[i]) i++;
        if (k < first[i]) i--;
        return i;
    }
    public boolean suraContainsPage(int k) {
        if (curSura == M) return (k == P);
        int i = first[curSura];
        int j = first[curSura+1];
        if (i == j) return (k == i);
        return (i<=k && k<j);
    }
     void setPage(int k) { // 0<=k<=P
        if (!suraContainsPage(k))
           setSura(suraFromPage(k));
        curPage = k;
        pan.setText(kur[k]);
        pan.setHTML(toHTML(qur[k]));
        pan.scrollToTop();
    }
    public void gotoPage(int k) {
        //if (k < 1) k = 1;
        //if (k > P) k = P;
        pan.slider.setValue(k);
    }
    void showName(int k) {
        pan.sura.setText(""+k);
        pan.name.setText(names[k]+" Suresi");
    }
    void setSura(int k) {
        if (curSura == k) return;
        curSura = k; showName(k);
        file = new File("sound", "s"+k+".mp3");
        if (!file.exists())
             file = new File("sound", "s"+k+".wav");
        pan.iqra.setVisible(file.exists()); //setEnabled
    }
    public void gotoSura(int k) {
        if (k < 1) k = 1;
        if (k > M) k = M;
        setSura(k);
        gotoPage(first[k]);
        if (playing && pan.iqra.isVisible()) audio(); //isEnabled
    }
    void audio() {
        try {
            String s = "runthis "+file;
            Runtime.getRuntime().exec(s);
            playing = true;
            System.out.println(s);
        } catch (IOException x) {
            System.err.println(x); 
        }
    }
    
    void showPopup(MouseEvent e) {
    //should be checked in both mousePressed and mouseReleased 
    //for proper cross-platform functionality.
        if (e.isPopupTrigger()) {
            popup.removeAll(); 
            JMenuItem mi = new JMenuItem(word);
            mi.setEnabled(false);
            popup.add(mi);
            Reference T = map.get(word);
            if (T==null) return;
            for (Location p: T.loc) popup.add(new Act(p));
            popup.show(html, e.getX()-10, e.getY()-10);
        }
    }
    /*  public void mousePressed(MouseEvent e) {
        showPopup(e); 
    }
    public void mouseReleased(MouseEvent e) {
        showPopup(e);
    }*/
    public void mouseExited(MouseEvent e) {
        //setMessage(" "); //moved out
        //count = 0;
        word = ""; html.setToolTipText(null);
    }
    public void mouseMoved(MouseEvent e) {
       JTextComponent src = (JTextComponent)e.getSource();
       int k = src.viewToModel(e.getPoint());
       if (Util.onSelection(src, k)) 
            src.setCursor(MOVE);
       else if (src != html) 
            src.setCursor(TEXT);
       else { //src is html
           word = Util.getWordFrom(src, k); 
           src.setToolTipText(word); 
           if (map!=null && map.containsKey(word)) 
                src.setCursor(HAND); 
           else src.setCursor(TEXT);
       }
    }
    public void stateChanged(ChangeEvent e) {
        int k = -1;
        if (e.getSource() == pan.slider) {
            k = pan.slider.getValue();
            pan.page.setText(""+k);
        }
        if (k == -1) return;
        if (!suraContainsPage(k))
           showName(suraFromPage(k));
        if (pan.slider.getValueIsAdjusting()) 
           playing = false;
        else setPage(k);
    } 
    public void actionPerformed(ActionEvent e) {
        Object src = e.getSource();
        if (src == pan.sura)  // reach here when CR is pressed
           gotoSura(Integer.parseInt(pan.sura.getText()));
        else if (src == pan.prevS) 
           gotoSura(curSura-1);
        else if (src == pan.nextS) 
           gotoSura(curSura+1); 
        else if (src == pan.prevP) 
           gotoPage(curPage-1);
        else if (src == pan.nextP) 
           gotoPage(curPage+1); 
        else if (src == pan.iqra) 
           audio();
        else if (src == pan.page) {  
           gotoPage(Integer.parseInt(pan.page.getText()));
           playing = false;
        } 
    }
    
    public void readNames() {
        try {
           BufferedReader in = new BufferedReader( 
              new InputStreamReader(Util.toStream(NAM)) 
           ); 
           for (int i=1; i<=M; i++) {
               String s = in.readLine();
               int j = s.indexOf(9); //TAB
               names[i] = s.substring(j+1);
               first[i] = Integer.parseInt(s.substring(0, j));
           }
           in.close();
        } catch (IOException x) {
           System.err.println(x); 
        }
    }
    public void readMap(InputStream is) {
        map = (Map<String,Reference>)Util.readObject(is);
    }
    
    public static String toHTML(String s) {
        int k = s.lastIndexOf(Util.LEFT);
        //strip last 6 chars after last LEFT 
        //System.err.println(s.length()+" "+k); 
        return HEAD + s.substring(0, k) + TAIL; 
    }
    public static void main(String args[]) {
        new Iqra3();
    }
    
    class Act extends AbstractAction {
        Location loc;
        public Act(Location c) {
            super(""+c); loc = c;
        }
        public void actionPerformed(ActionEvent e) {
            //txt.select(left, right);
            System.err.println(loc);
        }
    }
}

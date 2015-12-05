/*
 * Sep 29, 2003, Created 4:33 AM  
 * Jan 02, 2004  iqra package --> ezvu 
 * Nov 04, 2006  BasicArrowButton
 * Oct 19, 2009  text & area added -- compiled with java 4
 * Sep 25, 2011  GIF --> gif
 * Apr-May 2012  V3.0 Arabic text
 */

package mae.iqra;

import java.io.*;
import java.net.URL;
import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;
import mae.util.Console;
import mae.util.TinyButton;
import mae.util.ArrowButton;
import mae.util.PropertyManager;

/**
 *
 * @author  Eyler
 */
public class Iqra3 extends JFrame 
    implements ActionListener, ChangeListener {
    
    final static String TITLE = "Iqra V3.01"; 
    final static String QUR = "Quran.txt"; 
    final static String KUR = "Kuran.txt"; 
    final static String NAM = "iqra.names";
    final static String UTF = "UTF-8";
    final static String HEAD = "<FONT size=5 FACE=me_quran><center>";
    final static int P = 604; //pages
    final static int M = 114; //suras
    
    final JLabel name = new JLabel(); 
    final JSlider slider = new JSlider(JSlider.VERTICAL, 1, P, P);
    final JButton iqra = new TinyButton("Oku");
    final JButton prevS = new ArrowButton(1);
    final JTextField sura = new JTextField();
    final JButton nextS = new ArrowButton(5);
    final JButton prevF = new ArrowButton(1);
    //final JTextField search = new JTextField();
    final JButton nextF = new ArrowButton(5);
    final JButton prevP = new ArrowButton(1);
    final JTextField page = new JTextField();
    final JButton nextP = new ArrowButton(5);
    final JEditorPane area = new JEditorPane();
    //final JTextArea area = new JTextArea();
    final JTextArea meal = new JTextArea();
    boolean playing;
    int curSura, curPage;
    File file;
    final String[] names = new String[M+1];
    final int[] first = new int[M+1];
    final String[] qur, kur;
    
    void readNames(InputStream is) {
        try {
           BufferedReader in = new BufferedReader(
              new InputStreamReader(is, "Cp1254")
           );
           for (int i=1; i<=M; i++) {
               String s = in.readLine();
               int j = s.indexOf(9); //TAB
               names[i] = s.substring(j+1);
               first[i] = Integer.parseInt(s.substring(0, j));
           }
           in.close();
        } catch (IOException x) {
           System.out.println(x); 
        }
    }
    static String[] readText(InputStream is) {
        String[] a = null;
        try {
           char[] c = new char[is.available()];
           Reader in = new InputStreamReader(is, UTF);
           in.read(c);
           in.close();
           a = new String(c).split("¶");
           System.out.println(a.length+" pages"); 
        } catch (Exception x) {
           System.out.println(x); 
        }
        return a;
    }
    static String toHTML(String s) {
        //s = s.replaceAll(TextMaker.HEAD, "<BR>");
        return HEAD+s;
    }
    public static JPanel newPanel(Component[] ca) {
        JPanel pan = new JPanel(new FlowLayout(0, 0, 0));
        //for (Component c: ca) pan.add(c);
        for (int i=0; i<ca.length; i++) pan.add(ca[i]);
        return pan;
    }

    public Iqra3() { this(false); }
    public Iqra3(boolean exit) {
        super(TITLE);   
        setResizable(true);  /***/
        PropertyManager.setIcon(this, "iqra.gif");

        int disp = exit? EXIT_ON_CLOSE : DISPOSE_ON_CLOSE; 
        setDefaultCloseOperation(disp);
        JPanel pan = new JPanel(new BorderLayout(3, 3));
        pan.setBorder(BorderFactory.createEmptyBorder(3, 3, 3, 0));
        setContentPane(pan);
        pan.add(topPanel(), "North");
        
        slider.setInverted(true);
        slider.addChangeListener(this);
        swapKeys(slider, KeyEvent.VK_HOME, KeyEvent.VK_END);
        swapKeys(slider, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT);
        pan.add(slider, "East");

        //area.setFont(new Font("me_quran", 0, 20));  /***/
        //area.setColumns(30);  /***/
        //area.setRows(15);
        area.setEditable(false);
        area.setContentType("text/html");
        //area.setLineWrap(true); 
        //area.setWrapStyleWord(true);
        area.setDragEnabled(true);
        Console.setDragFeedback(area);
        JScrollPane scr = new JScrollPane(area);
        scr.setPreferredSize(new Dimension(405, 640));
        pan.add(scr, "Center"); 
        
        meal.setColumns(34); 
        meal.setEditable(false);
        meal.setLineWrap(true); 
        meal.setWrapStyleWord(true);
        meal.setDragEnabled(true);
        Console.setDragFeedback(meal);
        pan.add(new JScrollPane(meal), "West");
        
        pack(); 
	Dimension d = getToolkit().getScreenSize();
	int x = (d.width - getWidth())/2;
	int y = (d.height - getHeight())/2 - 50;
        if (y < 0) y = 0;
	setLocation(x, y);

        qur = readText(getClass().getResourceAsStream(QUR));
           System.out.println(QUR+" "+qur.length); 
        kur = readText(getClass().getResourceAsStream(KUR));
           System.out.println(KUR+" "+kur.length); 
        readNames(getClass().getResourceAsStream(NAM)); 
           System.out.println("readNames "+names.length); 
        
        setVisible(true);
        gotoSura(1);
        slider.requestFocus();
    }
    JPanel topPanel() {
        JPanel top = new JPanel(new BorderLayout(5, 5));
                //new BoxLayout(top, BoxLayout.X_AXIS));
        iqra.addActionListener(this);
        //search.setText("ara");
        //search.setColumns(12);
        //search.selectAll();
        //prevS.setPreferredSize(new Dimension(18, 12));
        prevS.addActionListener(this);

        sura.setColumns(3);
        sura.setHorizontalAlignment(SwingConstants.CENTER);
        sura.addActionListener(this);
        nextS.addActionListener(this);
        Component h1 = Box.createHorizontalStrut(10);
      //Component h2 = Box.createHorizontalStrut(50);
        
        Component[] c1 = 
            {iqra, h1, /*prevF, search, nextF, h2,*/ prevS, sura, nextS}; 
        top.add(newPanel(c1), "West");

        //Component[] c2 = {name, h2, prevF, search, nextF};
        //top.add(newPanel(c2), "Center");
        top.add(name, "Center");
        
        JLabel lab = new JLabel("Sayfa");
        prevP.addActionListener(this);

        page.setColumns(3);
        page.setHorizontalAlignment(SwingConstants.CENTER);
        page.addActionListener(this); 
        nextP.addActionListener(this);
        Component h4 = Box.createHorizontalStrut(4);
        Component h5 = Box.createHorizontalStrut(10);
        Component[] c4 = {lab, h4, prevP, page, nextP,h5};
        top.add(newPanel(c4), "East");
        return top;
    }

    public static void swapKeys(JComponent c, int s1, int s2) {
        KeyStroke k1 = KeyStroke.getKeyStroke(s1, 0);
        KeyStroke k2 = KeyStroke.getKeyStroke(s2, 0);
        InputMap im = c.getInputMap();
        Object x = im.get(k1); 
        im.put(k1, im.get(k2));
        im.put(k2, x);
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
    void setPage(int k) { // 0<k<=P
        if (!suraContainsPage(k))
           setSura(suraFromPage(k));
        curPage = k;
        area.setText(HEAD+qur[k-1]);
        meal.setText(kur[k-1]);
        //pack();  
        //validate();
    }
    public void gotoPage(int k) {
        if (k < 1) k = 1;
        if (k > P) k = P;
        slider.setValue(k);
    }
    void showName(int k) {
        //sura.setValue(k);  
        sura.setText(""+k);
        name.setText(names[k]+" Suresi");
    }
    void setSura(int k) {
        if (curSura == k) return;
        curSura = k; showName(k);
        file = new File("sound", "s"+k+".wav");
        iqra.setVisible(file.exists()); //setEnabled
    }
    public void gotoSura(int k) {
        if (k < 1) k = 1;
        if (k > M) k = M;
        setSura(k);
        gotoPage(first[k]);
        if (playing && iqra.isEnabled()) iqra();
    }
    void iqra() {
        try {
            String s = "runthis "+file;
            Runtime.getRuntime().exec(s);
            playing = true;
            System.out.println(s);
        } catch (IOException x) {
            System.out.println(x); 
        }
    }

    public void stateChanged(ChangeEvent e) {
        int k = -1;
        if (e.getSource() == slider) {
            k = slider.getValue();
            //page.setValue(k);  
            page.setText(""+k);
        }
        if (k == -1) return;
        if (!suraContainsPage(k))
           showName(suraFromPage(k));
        if (slider.getValueIsAdjusting()) 
           playing = false;
        else setPage(k);
    } 
    public void actionPerformed(ActionEvent e) {
        Object src = e.getSource();
        if (src == sura)  // reach here when CR is pressed
           gotoSura //((Integer)sura.getValue());
                   (Integer.parseInt(sura.getText()));
        else if (src == prevS) 
           gotoSura(curSura-1);
        else if (src == nextS) 
           gotoSura(curSura+1); 
        else if (src == prevP) 
           gotoPage(curPage-1);
        else if (src == nextP) 
           gotoPage(curPage+1); 
        else if (src == iqra) 
           iqra();
        else if (src == page) {  
           gotoPage //((Integer)page.getValue());  
                   (Integer.parseInt(page.getText()));
           playing = false;
        } 
    }
    
    public static void main(String args[]) {
        new Iqra3(getFrames().length == 0);
    }
}

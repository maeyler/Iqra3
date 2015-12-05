/*
 * Sep 29, 2003, Created 4:33 AM  
 * Jan 02, 2004  iqra package --> ezvu later
 * May 14, 2006  Spinner for page -- reverted
 * Nov 04, 2006  BasicArrowButton
 * Oct 19, 2009  text & area added -- compiled with java 4
 * Sep 25, 2011  GIF --> gif
 */

package iqra;

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
public class Iqra extends JFrame 
    implements ActionListener, ChangeListener {
    
    JLabel name, lab1, lab2;
    //JSpinner sura, page;
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
    final JTextArea area = new JTextArea();
    boolean playing;
    int curSura, curPage;
    File file;
    final static String TXT = "Quran.txt"; /***/
    final static int P = 604; //pages
    final static int M = 114; //suras
    final static String[] names = new String[M+1];
    final static int[] first = new int[M+1];
    static String[] text;
    
    static void readNames(InputStream is) {
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
    static void readText() {
        try {
           InputStream is = new FileInputStream(TXT);  /***/
           char[] c = new char[is.available()];
           Reader in = new InputStreamReader(is, "UTF-8");  /***/
           in.read(c);
           in.close();
           text = new String(c).split("¶");
           System.out.println(text.length+" lines"); 
        } catch (Exception x) {
           System.out.println(x); 
        }
    }

    public static JPanel newPanel(Component[] ca) {
        JPanel pan = new JPanel(new FlowLayout(0, 0, 0));
        //for (Component c: ca) pan.add(c);
        for (int i=0; i<ca.length; i++) pan.add(ca[i]);
        return pan;
    }

    public Iqra() { this(false); }
    public Iqra(boolean exit) {
        super("Iqra");   
        setResizable(true);  /***/
        PropertyManager.setIcon(this, "iqra.gif");

        int disp = exit? EXIT_ON_CLOSE : DISPOSE_ON_CLOSE; 
        setDefaultCloseOperation(disp);
        JPanel p1 = new JPanel(new BorderLayout(2, 5));
        p1.setBorder(BorderFactory.createEmptyBorder(3,3,3,3));
        setContentPane(p1);
        p1.add(topPanel(), "North");
        
        JPanel pan = new JPanel(new BorderLayout(2, 5));
        pan.add(midPanel(), "Center");
        slider.setInverted(true);
        slider.addChangeListener(this);
        pan.add(slider, "East");
        p1.add(pan, "West");

      //int v = TextArea.SCROLLBARS_VERTICAL_ONLY;
        area.setColumns(30);  /***/
        area.setEditable(false);
        area.setLineWrap(true); 
        area.setWrapStyleWord(true);
        if (Console.setDragEnabled(area))
            Console.setDragFeedback(area);
        p1.add(new JScrollPane(area), "Center"); //East");
        area.setFont(new Font("me_quran", 0, 20));  /***/
        //area.setFont(new Font("SansSerif", 0, 20));  /***/
        //Traditional Arabic  
        //Shaikh Hamdullah Basic 
        
        pack(); 
	Dimension d = getToolkit().getScreenSize();
	int x = d.width - getWidth();
	int y = d.height - getHeight();
	setLocation(x/2, y/2 - 50);

        readNames(getClass().getResourceAsStream("iqra.names")); 
        readText();
           System.out.println("readText"); 
        
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
        //SpinnerNumberModel mod = new SpinnerNumberModel(1, 1, M, 1);
        //sura = new JSpinner(new SpinnerNumberModel(1, 1, M, 1));    
        //sura.addChangeListener(this);
        sura.setColumns(3);
        sura.setHorizontalAlignment(SwingConstants.CENTER);
        sura.addActionListener(this);
        //nextS.setPreferredSize(new Dimension(18, 12));
        nextS.addActionListener(this);
        Component h1 = Box.createHorizontalStrut(10);
        Component h2 = Box.createHorizontalStrut(50);
        name = new JLabel();
        Component[] c1 = 
            {iqra, /*h1, prevF, search, nextF,*/ h2, prevS, sura, nextS}; 
        top.add(newPanel(c1), "West");

        //Component[] c2 = {name, h2, prevF, search, nextF};
        //top.add(newPanel(c2), "Center");
        top.add(name, "Center");
        
        JLabel lab = new JLabel("Sayfa");
        //prevP.setPreferredSize(new Dimension(20, 15));
        prevP.addActionListener(this);
        //page = new JSpinner(new SpinnerNumberModel(1, 1, P, 1));    
        //page.addChangeListener(this);
        page.setColumns(3);
        page.setHorizontalAlignment(SwingConstants.CENTER);
        page.addActionListener(this); 
        //nextP.setPreferredSize(new Dimension(20, 15));
        nextP.addActionListener(this);
        Component h4 = Box.createHorizontalStrut(2);
        Component[] c4 = {lab, h4, prevP, page, nextP};
        top.add(newPanel(c4), "East");
        return top;
    }
    JPanel midPanel() {
        JPanel mid = new JPanel();
        mid.setLayout(new BoxLayout(mid, BoxLayout.Y_AXIS));
        lab1 = new JLabel();
        lab1.setPreferredSize(new Dimension(335, 283));
        mid.add(lab1);
        lab2 = new JLabel();
        lab2.setPreferredSize(new Dimension(335, 244));
        mid.add(lab2);
        mid.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        return mid;
    }
    
    public int suraFromPage(int k) {
        int i = 0;
        while (k > first[i]) i++;
        if (k < first[i]) i--;
        return i;
    }
    String threeDigits(int k) {
        String s = ""+k;
        switch (s.length()) {
        case 1:  return "00"+s;
        case 2:  return "0"+s;
        case 3:  return s;
        default: return s.substring(0, 3);
        }
    }
    boolean suraContainsPage(int k) {
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
        area.setText(text[k-1]);
        String s = "/pages/"+threeDigits(k);
        URL u1 = getClass().getResource(s+"a.gif");
        lab1.setIcon(new ImageIcon(u1)); 
        if (k < 3) lab2.setIcon(null);
        else {
           URL u2 = getClass().getResource(s+"b.gif");
           lab2.setIcon(new ImageIcon(u2)); 
        }
        pack();  //validate();
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
     /* if (e.getSource() == sura) {
            gotoSura((Integer)sura.getValue()); 
            return;
        }
        if (e.getSource() == page) {
            k = (Integer)page.getValue();
            slider.setValue(k);
        }  */
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
        new Iqra(getFrames().length == 0);
    }
}

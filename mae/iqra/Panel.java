// Apr-May 2012  V3.0 Arabic text

package mae.iqra;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.event.*;
import mae.util.Console;
import mae.util.TinyButton;
import mae.util.ArrowButton;
import mae.util.PropertyManager;
import mae.util.Scaler;

public class Panel extends JPanel  {
    
    public static final String GIF = "iqra.gif";
    static final int G = 5; 
    
    final JFrame frm = new JFrame(Iqra3.TITLE);
    final JTextArea text = new JTextArea();
    final JEditorPane html = new JEditorPane();
    final JLabel name = new JLabel(); 
    final JSlider slider = new JSlider(JSlider.VERTICAL);
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
    
    public Panel(Iqra3 Q) {
        super(new BorderLayout(G, G));
        setBorder(BorderFactory.createEmptyBorder(G, G, G, 0));
        add(topPanel(), "North");
        
        slider.setInverted(true);
        slider.setMinimum(1);
        slider.setMaximum(Iqra3.P);
        slider.addChangeListener(Q);
        swapKeys(slider, KeyEvent.VK_HOME, KeyEvent.VK_END);
        swapKeys(slider, KeyEvent.VK_LEFT, KeyEvent.VK_RIGHT);
        add(slider, "East");

        //area.setFont(new Font("me_quran", 0, 20));  /***/
        //area.setColumns(30);  /***/
        //area.setRows(15);
        html.setEditable(false);
        html.setContentType("text/html");
        //area.setLineWrap(true); 
        //area.setWrapStyleWord(true);
        html.setDragEnabled(true);
        //Console.setDragFeedback(html);
        JScrollPane scr = new JScrollPane(html);
        scr.setPreferredSize(new Dimension(400,600));  //(640, 640));
        add(scr, "Center"); 
        //html.addMouseListener(Q);
        //html.addMouseMotionListener(Q);
        
        text.setFont(new Font("Serif", 0, 14));
        text.setColumns(30);   /***/
        text.setEditable(false);
        text.setLineWrap(true); 
        text.setWrapStyleWord(true);
        text.setDragEnabled(true);
        //Console.setDragFeedback(text);
        add(new JScrollPane(text), "West");
        text.addMouseListener(Q);
        text.addMouseMotionListener(Q);
        
        frm.setContentPane(this);
        frm.setResizable(true);  /***/
        java.net.URL u = getClass().getResource(GIF);
        PropertyManager.setIcon(frm, u);
        iqra.addActionListener(Q);
        prevS.addActionListener(Q);
        sura.addActionListener(Q);
        nextS.addActionListener(Q);
        prevP.addActionListener(Q);
        page.addActionListener(Q); 
        nextP.addActionListener(Q);

        boolean exit = (JFrame.getFrames().length == 0);
        int disp = exit? JFrame.EXIT_ON_CLOSE : JFrame.DISPOSE_ON_CLOSE; 
        frm.setDefaultCloseOperation(disp);
        Scaler.scaleWindow(frm);  //frm.pack(); 
	Dimension d = getToolkit().getScreenSize();
	int x = (d.width - getWidth())/2;
	int y = (d.height - getHeight())/2 - 50;
        if (y < 0) y = 0; /***/
	frm.setLocation(x, y);

        frm.setVisible(true);
        slider.requestFocusInWindow(); /***/
    }
    JPanel topPanel() {
        JPanel top = new JPanel(new BorderLayout(G, G));
                //new BoxLayout(top, BoxLayout.X_AXIS));
        //search.setText("ara");
        //search.setColumns(12);
        //search.selectAll();
        //prevS.setPreferredSize(new Dimension(18, 12));

        Font FONT = new Font("SansSerif", 0, 12);
        sura.setColumns(3); sura.setFont(FONT);
        sura.setHorizontalAlignment(SwingConstants.CENTER);
        Component h1 = Box.createHorizontalStrut(10);
      //Component h2 = Box.createHorizontalStrut(50);
        
        Component[] c1 = 
            {iqra, h1, /*prevF, search, nextF, h2,*/ prevS, sura, nextS}; 
        top.add(newPanel(c1), "West");

        //Component[] c2 = {name, h2, prevF, search, nextF};
        //top.add(newPanel(c2), "Center");
        name.setFont(FONT); top.add(name, "Center");
        
        JLabel lab = new JLabel("Sayfa");
        lab.setFont(FONT);
        
        page.setColumns(3); page.setFont(FONT);
        page.setHorizontalAlignment(SwingConstants.CENTER);
        Component h4 = Box.createHorizontalStrut(4);
        Component h5 = Box.createHorizontalStrut(10);
        Component[] c4 = {lab, h4, prevP, page, nextP,h5};
        top.add(newPanel(c4), "East");
        return top;
    }

    public static JPanel newPanel(Component[] ca) {
        JPanel pan = new JPanel(new FlowLayout(0, 0, 0));
        //for (Component c: ca) pan.add(c);
        for (int i=0; i<ca.length; i++) pan.add(ca[i]);
        return pan;
    }
    final Runnable scroller = new Runnable() {
        final Rectangle r = new Rectangle(0, 0, 0, 0);
        public void run() {
           text.scrollRectToVisible(r);
           html.scrollRectToVisible(r);
        }
    };
    void scrollToTop() {
        SwingUtilities.invokeLater(scroller);
    }
    void setText(String s) {
        text.setText(s);
    }
    void setHTML(String s) {
        html.setText(s);
    }

    public static void swapKeys(JComponent c, int s1, int s2) {
        KeyStroke k1 = KeyStroke.getKeyStroke(s1, 0);
        KeyStroke k2 = KeyStroke.getKeyStroke(s2, 0);
        InputMap im = c.getInputMap();
        Object x = im.get(k1); 
        im.put(k1, im.get(k2));
        im.put(k2, x);
    }
    public static void main(String args[]) {
        new Panel(null);
    }
}
